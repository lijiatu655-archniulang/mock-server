const request = require('../utils/request')

function list() {
  return request.get('/users/family').then(function (res) {
    if (Array.isArray(res)) return res
    return (res && res.list) || []
  })
}

function create(data) {
  return request.post('/users/family', data || {})
}

function update(id, data) {
  return request.put('/users/family/' + id, data || {})
}

function remove(id) {
  return request.del('/users/family/' + id)
}

module.exports = {
  list: list,
  create: create,
  update: update,
  remove: remove
}
