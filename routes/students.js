const express = require('express')
const debug = require('debug')('mad9124-w21-a2-mongo-crud')
const router = express.Router()
const Students = require('../models/students')
const sanitizedBody = require('../middleware/sanitizeBody')

router.get('/', async (req, res) => {
    const students = await Students.find()
    res.send({data: students.map(student => formatResponseData('students', student.toObject()))})
})

router.post('/' , sanitizedBody, async (req, res) => {
    const attributes = req.sanitizedBody
    delete attributes._id
    let newStudent = new Students(attributes)
    await newStudent.save()
    res.status(201).json({data: formatResponseData('students', newStudent.toObject())})
})

router.get('/:id', async (req, res) => {
    try {
        const students = await Students.findById(req.params.id)
        if (!students) throw new Error('Resource not found')
        res.send({data: formatResponseData('students', students.toObject())})
    } catch (err) {
        sendResourceNotFound(req, res)
    }
})

router.patch('/:id', sanitizedBody, async (req, res) => {
    try {
        const {_id, ...otherAttributes} = req.sanitizedBody
        const students = await Students.findByIdAndUpdate(
          req.params.id,
          {_id: req.params.id, ...otherAttributes},
          {
            new: true,
            runValidators: true
          }
        )
        if (!students) throw new Error('Resource not found')
        res.send({data: formatResponseData('students', students.toObject())})
      } catch (err) {
        sendResourceNotFound(req, res)
      }
})

router.put('/:id', sanitizedBody, async (req, res) => {
    try {
        const {_id, ...otherAttributes} = req.sanitizedBody
        const students = await Students.findByIdAndUpdate(
          req.params.id,
          {_id: req.params.id, ...otherAttributes},
          {
            new: true,
            overwrite: true,
            runValidators: true
          }
        )
        if (!students) throw new Error('Resource not found')
        res.send({data: formatResponseData('students', students.toObject())})
      } catch (err) {
        sendResourceNotFound(req, res)
      }
})

router.delete('/:id', async (req, res) => {
    try {
        const students = await Students.findByIdAndRemove(req.params.id).populate('owner')
        if (!students) throw new Error('Resource not found')
        res.send({data: formatResponseData('students', students.toObject())})
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
          description: `We could not find a student with id: ${req.params.id}`,
        },
      ],
    });
}
  

module.exports = router
