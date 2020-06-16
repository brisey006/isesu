const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

//Mongo connection


const Resource = require('../models/resource');
const Level = require('../models/level');
const User = require('../models/User');

router.get('/', async (req, res) => {

    try {
        const levelId = req.query.level;
        const q = req.query.q;
        const subject = req.query.subject;

        const level = await Level.findById(levelId).populate({ 
            path: 'subjects',
            select: 'resources title',
            match: { '_id': subject },
            populate: { 
                path: 'resources', 
                match: {
                    $or: [
                        {'title': {'$regex': q, '$options': 'i'}},
                        {'description': {'$regex': q, '$options': 'i'}},
                        {'topic': {'$regex': q, '$options': 'i'}}
                    ]
                }
            },
        });
        
        if (level == null && subject == undefined) {
            const resources = await Resource.find().or([
                {'title': {'$regex': req.query.q, '$options': 'i'}},
                {'description': {'$regex': req.query.q, '$options': 'i'}},
                {'topic': {'$regex': req.query.q, '$options': 'i'}},
            ]);
            res.status(200).json(resources);
        } else if (subject !== undefined && level == null) {
            const subject = req.query.subject;
            const resources = await Resource.find();

            const assd = resources.filter((d) => {
                return d.subjects.indexOf(subject) > -1;
            });

        res.status(200).json(assd);
        } else {
        	const ress = level["subjects"][0]["resources"];
        	const ty = ress.filter(d => {
				return d.levels.indexOf(levelId) > -1;
        	});
            res.status(200).json(ty);
        }
        
    } catch(e) {
        res.json({
            "error": e.message,
        });
    }
});

router.get('/file-type/:type', async (req, res) => {
    const resources = await Resource.find({ fileType: req.params.type });
    res.json(resources);
});

router.get('/resource-type/:type', async (req, res) => {
    const resources = await Resource.find({ resourceUse: req.params.type });
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
