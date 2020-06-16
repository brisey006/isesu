const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const Resource = require('../models/resource');
const Level = require('../models/level');
const User = require('../models/User');

router.get('/', async (req, res) => {
    if (req.query.level == undefined && req.query.subject == undefined && req.query.q !== undefined) {
        Resource.find().or([
            {'title': {'$regex': req.query.q, '$options': 'i'}},
            {'description': {'$regex': req.query.q, '$options': 'i'}},
            {'topic': {'$regex': req.query.q, '$options': 'i'}}
        ])
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(503).send(err);
        });
    } 
    
    else if (req.query.level != undefined && req.query.subject == undefined && req.query.q !== undefined) {
        const query = req.query.q;
        const level = req.query.level;

        const resources = await Resource.find().or([
            {'title': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
            {'topic': {'$regex': req.query.q, '$options': 'i'}}
        ]);

        const assd = resources.filter((d) => {
            return d.levels.indexOf(level) > -1;
        });

        res.status(200).json(assd);
    } 

    else if (req.query.level == undefined && req.query.subject !== undefined && req.query.q !== undefined) {
        const query = req.query.q;
        const subject = req.query.subject;

        const resources = await Resource.find().or([
            {'title': {'$regex': query, '$options': 'i'}},
            {'description': {'$regex': query, '$options': 'i'}},
            {'topic': {'$regex': req.query.q, '$options': 'i'}}
        ]);

        const assd = resources.filter((d) => {
            return d.subjects.indexOf(subject) > -1;
        });

        res.status(200).json(assd);
    } 

    else if (req.query.level == undefined && req.query.subject !== undefined && req.query.q == undefined) {
        const query = req.query.q;
        const subject = req.query.subject;

        const resources = await Resource.find();

        const assd = resources.filter((d) => {
            return d.subjects.indexOf(subject) > -1;
        });

        res.status(200).json(assd);
    }

    else if (req.query.level != undefined && req.query.subject == undefined && req.query.q == undefined) {
        const level = req.query.level;

        const resources = await Resource.find();

        const assd = resources.filter((d) => {
            return d.levels.indexOf(level) > -1;
        });

        res.status(200).json(assd);
    }
    
    else if (req.query.level !== undefined && req.query.subject !== undefined  && req.query.q !== undefined) {
        const query = req.query.q;
        const level = req.query.level;
        const subject = req.query.subject;

        const resources = await Resource.find().or([
            {'title': {'$regex': req.query.q, '$options': 'i'}},
            {'description': {'$regex': req.query.q, '$options': 'i'}},
            {'topic': {'$regex': req.query.q, '$options': 'i'}}
        ]);

        const assd = resources.filter((d) => {
            return d.levels.indexOf(level) > -1;
        });

        const filtered = assd.filter((d) => {
            return d.subjects.indexOf(subject) > -1;
        });

        res.status(200).json(filtered);
    } 
    
    else {
        res.status(503).json({
            'error': 'Not available'
        });
    }
    
});

router.get('/file-type/:type', async (req, res) => {
	//res.json({"type": req.params.type});
    const resources = await Resource.find({ fileType: req.params.type });
    res.json(resources);
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
      while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
       }

  		return array;
}

router.get('/random', async (req, res) => {
	const resources = await Resource.find().populate('creator');
	res.json(shuffle(resources));
});

module.exports = router;
