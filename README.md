<h1 align="center">
  Write 🙉
</h1>

<p align="center">
  <strong>Minimal, distraction-free text editor</strong>
</p>

<p align="center">
<a href="https://app.netlify.com/sites/andreasphil-write/deploys">
   <img src="https://api.netlify.com/api/v1/badges/a3ce0cd2-fe7d-4e06-a7b3-6054931da36c/deploy-status" alt="Netlify Status" />
</a>
</p>

- 🧘‍♀️ Dead simple: Just a textbox that stores its contents in your browser storage
- 📋 Do your writing and copy the result to the clipboard when you're done
- 🤝 Zero tracking and no data ever leaves the browser

## Development

The site is a [Vue 3](https://vuejs.org) app based on my [Unbuild](https://github.com/andreasphil/unbuild) template. The setup doesn't use any build steps or package management. You'll need a HTTP server for serving the project during development, since features such as JavaScript modules are not supported by the file protocol. Any server will do. I like [`servor`](https://github.com/lukejacksonn/servor):

```sh
# --browse launches a browser, --reload reloads when files change
npx servor --browse --reload
```

## Deployment

Deployment should work out of the box when linking the repository to a project on [Netlify](https://netlify.com).

## Credits

Apart from the open source packages listed in [index.html](index.html), Write uses icons from [Lucide](https://lucide.dev).

Thanks 🙏
