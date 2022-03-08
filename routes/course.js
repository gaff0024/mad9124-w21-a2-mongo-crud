const express = require('express')
const debug = require('debug')('mad9124-w21-a2-mongo-crud')
const router = express.Router()
const Courses = require('../models/courses')
const sanitizedBody = require('../middleware/sanitizeBody')
const sanitizeMongo = require('express-mongo-sanitize')

router.get('/', async (req, res) => {
    const courses = await Courses.find()
    res.send({data: courses.map(course => formatResponseData('courses', course))})
})

router.post('/', sanitizeMongo , sanitizedBody, async (req, res) => {
    const attributes = req.sanitizedBody
    delete attributes._id
    let newCourse = new Courses(attributes)
    await newCourse.save()
    res.status(201).json({data: formatResponseData('courses', newCourse.toObject())})
})

router.get('/:id', async (req, res) => {
    try {
        const course = await Courses.findById(req.params.id).populate('students')
        if (!course) throw new Error('Resource not found')
        res.send({data: formatResponseData('courses', course)})
    } catch (err) {
        sendResourceNotFound(req, res)
    }
})

router.patch('/:id', sanitizeMongo, sanitizedBody, async (req, res) => {
    try {
        const {_id, ...otherAttributes} = req.sanitizedBody
        const course = await Courses.findByIdAndUpdate(
          req.params.id,
          {_id: req.params.id, ...otherAttributes},
          {
            new: true,
            runValidators: true
          }
        )
        if (!course) throw new Error('Resource not found')
        res.send({data: formatResponseData('courses', course)})
      } catch (err) {
        sendResourceNotFound(req, res)
      }
})

router.put('/:id', sanitizeMongo, sanitizedBody, async (req, res) => {
    try {
        const {_id, ...otherAttributes} = req.sanitizedBody
        const course = await Courses.findByIdAndUpdate(
          req.params.id,
          {_id: req.params.id, ...otherAttributes},
          {
            new: true,
            overwrite: true,
            runValidators: true
          }
        )
        if (!course) throw new Error('Resource not found')
        res.send({data: formatResponseData('courses', course)})
      } catch (err) {
        sendResourceNotFound(req, res)
      }
})

router.delete('/:id', async (req, res) => {
    try {
        const course = await Courses.findByIdAndRemove(req.params.id).populate('owner')
        if (!course) throw new Error('Resource not found')
        res.send({data: formatResponseData('courses', course)})
      } catch (err) {
        sendResourceNotFound(req, res)
      }
})

/**
 * Format the response data object according to JSON:API v1.0
 * @param {string} type The resource collection name, e.g. 'cars'
 * @param {Object} resource An instance object from that collection
 * @returns
 */
function formatResponseData(type, resource) {
  const {id, ...attributes} = resource
  return {type, id, attributes}
}

function sendResourceNotFound(req, res) {
    res.status(404).send({
      errors: [
        {
          status: "404",
          title: "Resource does not exist",
          description: `We could not find a course with id: ${req.params.id}`,
        },
      ],
    });
}

module.exports = router