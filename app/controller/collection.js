const route = require('express').Router()
const bodyParser = require('body-parser')

class DataError {
  constructor(message){
    this.message = message
  }
}

function validateFormData ({name, version, url, tags, description, keyfrom} = {}) {
  let ok = true

  let errors = []
  addError = (err) => {
    ok = false
    errors.push(err)
  }

  if (!name) {
    addError(new DataError('The "name" value is required.'))
  }

  return { ok, errors }
}


route.get('/', async (req, res) => {
  const collection = []

  await connect.forEach((e) => {
    collection.push(e)
  })

  console.log(collection)

  res.render( 'index', {
    collection
  } )
})

/* ADD */

route.get('/add', (req, res) => {
  res.render( 'add' )
})

route.post('/add', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const err = validateFormData( req.body )

  if (err.ok === true) {

    const isSetter = await connect.set(req.body.name, req.body)

    if (isSetter === true) {
      res.redirect(302, '/element/' + req.body.name)
    }

  }

  res.render( 'add', {
    body: req.body,
    err
  } )
})

/* Edit */
route.get('/edit/:name', async (req, res) => {
  const { name } = req.params

  const exists = await connect.has( name )

  if (exists) {
    const el = await connect.get( name )

    return res.render( 'add', {
      customTitle: 'Update Lib',
      body: el
    } )
  } else {
    return next()
  }

})

route.post('/edit/:name', bodyParser.urlencoded({ extended: false }), async (req, res) => {
  const err = validateFormData( req.body )

  if (err.ok === true) {

    const isSetter = await connect.set(req.body.name, req.body)

    if (isSetter === true) {
      res.redirect(302, '/element/' + req.body.name)
    }

  }

  res.render( 'add', {
    customTitle: 'Update Lib',
    body: req.body,
    err
  } )
})



/* Element */
route.get('/element/:name', async (req, res, next) => {
  const { name } = req.params

  const exists = await connect.has( name )

  if (exists) {
    const el = await connect.get( name )

    return res.render( 'preview' , { body: el })
  } else {
    return next()
  }
})



exports = module.exports = {
  path: '/',
  route
}
