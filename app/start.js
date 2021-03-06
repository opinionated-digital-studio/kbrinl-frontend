const configPaths = require('../config/paths.json')
const PORT = process.env.PORT || configPaths.ports.app || 3333

const app = require('./app.js')()

app.listen(PORT, () => {
  console.log('Server started at http://localhost:' + PORT)
})
