import { useThemeColor } from "@andreasphil/design-system";
import Textarea2 from "@andreasphil/vue-textarea2";
import {
  computed,
  createApp,
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";

const App = defineComponent({
  components: { Textarea2 },

  setup() {
    onMounted(() => {
      useThemeColor();
    });

    /* -------------------------------------------------- *
     * All documents                                      *
     * -------------------------------------------------- */

    const documents = reactive(new Map());

    function restoreDocuments() {
      documents.clear();
      const stored = localStorage.getItem("documents");
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored);
        parsed.forEach((document) => documents.set(document.id, document));
      } catch {
        // Fail quietly
      }
    }

    function persistDocuments() {
      const asArray = Array.from(documents.values());
      localStorage.setItem("documents", JSON.stringify(asArray));
    }

    function createDocument() {
      const id = Math.round(Math.random() * 10 ** 16)
        .toString()
        .padEnd(16, "0");

      const document = { id, title: "", text: "" };
      documents.set(document.id, document);
      return document.id;
    }

    function updateDocument(id, patch) {
      if (!documents.has(id)) return;
      documents.set(id, { ...documents.get(id), ...patch });
    }

    function deleteDocument(id) {
      documents.delete(id);
    }

    const hasDocuments = computed(() => documents.size > 0);

    onMounted(() => {
      restoreDocuments();
    });

    watch(
      () => documents,
      () => {
        persistDocuments();
      },
      { deep: true }
    );

    /* -------------------------------------------------- *
     * Document selection                                 *
     * -------------------------------------------------- */

    const selectedDocument = ref();

    const documentDropdown = computed({
      get() {
        return selectedDocument.value ?? "__unselected__";
      },
      set(value) {
        if (value === "__new__") {
          const newId = createDocument();
          nextTick().then(() => {
            selectedDocument.value = newId;
          });
        } else {
          selectedDocument.value = value;
        }
      },
    });

    const titleEl = ref();

    watch(selectedDocument, async () => {
      await nextTick();
      titleEl.value?.focus();
    });

    /* -------------------------------------------------- *
     * Current document                                   *
     * -------------------------------------------------- */

    const title = computed({
      get() {
        if (!selectedDocument.value) return;
        return documents.get(selectedDocument.value)?.title;
      },
      set(value) {
        if (!selectedDocument.value) return;
        updateDocument(selectedDocument.value, { title: value });
      },
    });

    const text = computed({
      get() {
        if (!selectedDocument.value) return "";
        return documents.get(selectedDocument.value)?.text ?? "";
      },
      set(value) {
        if (!selectedDocument.value) return;
        updateDocument(selectedDocument.value, { text: value });
      },
    });

    function onDelete() {
      if (!selectedDocument.value) return;

      const shouldDelete = confirm(
        "Are you sure you want to delete this document?"
      );

      if (shouldDelete) {
        deleteDocument(selectedDocument.value);
        selectedDocument.value = undefined;
      }
    }

    const copySuccess = ref();

    async function onCopy() {
      if (!text.value) return;

      try {
        await navigator.clipboard.writeText(text.value);

        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 1000);
      } catch {
        alert("Failed to copy the current document text.");
      }
    }

    /* -------------------------------------------------- *
     * Component scope                                    *
     * -------------------------------------------------- */

    return {
      // All documents
      documents,
      hasDocuments,

      // Document selection
      documentDropdown,
      selectedDocument,

      // Current document
      copySuccess,
      onCopy,
      onDelete,
      text,
      title,
      titleEl,
    };
  },

  template: /* html */ `
    <header>
      <nav data-variant="fixed">
        <div class="header-title">
          <img
            src="./assets/icon-192.png"
            class="header-logo"
            width="42"
            height="42"
          />

          <select class="header-picker" v-model="documentDropdown">
            <option
              v-if="documentDropdown === '__unselected__'"
              disabled
              value="__unselected__"
            >
              Documents
            </option>

            <option value="__new__">New...</option>

            <optgroup label="Documents">
              <option v-for="[, doc] in documents" :value="doc.id" :key="doc.id">
                {{ doc.title || "Untitled" }}
              </option>

              <option v-if="!hasDocuments" value="__empty__" disabled>
                No documents
              </option>
            </optgroup>
          </select>
        </div>

        <ul v-if="!!selectedDocument" class="header-tools">
          <li>
            <button data-variant="ghost" @click="onDelete()" :disabled="!selectedDocument">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              <span>Delete</span>
            </button>
          </li>
          <li>
            <button @click="onCopy()" :disabled="!selectedDocument">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-copy"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/></svg>
              <span v-if="copySuccess">Copied!</span>
              <span v-else="copySuccess">Copy</span>
            </button>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <template v-if="selectedDocument">
        <input
          ref="titleEl"
          v-model="title"
          class="document-title"
          placeholder="Untitled Document"
          type="text"
        />

        <Textarea2 v-model="text" class="document-text" />
      </template>

      <div v-else class="home">
        <img class="logo" src="./assets/icon-192.png" width="72" height="72" />
        <hgroup>
          <h1>Write</h1>
          <p>
            A minimal, distraction-free text editor. Select or create a document to get started.
          </p>
        </hgroup>

        <button @click="documentDropdown = '__new__'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus-2"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M6 12v6"/></svg>
          New document
        </button>
      </div>
    </main>
  `,
});

createApp(App).mount("#app");
