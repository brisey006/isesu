const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { authorized } = require('../config/auth');

const Resource = require('../models/resource');
const User = require('../models/User');
const Subject = require('../models/subject');
const Level = require('../models/level');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.post('/', async (req, res) => {
    try{
        let { title, description, fileUrl, fileType, hyperLink, levels, subjects, id, author, publisher, licence, topic, resourceUse, thumbnail } = req.body;

        let resource = Resource({ title, description, fileUrl, fileType, hyperLink, author, publisher, licence, topic, resourceUse, thumbnail, approved: false });
        const user = await User.findById(id);
        //const subjectLevel = await Level.findById(level);
        resource.creator = user._id;

        levels = levels == null ? [] : levels;
        subjects = subjects == null ? [] : subjects;

        if (levels.length > 0) {
            for (let i = 0; i < levels.length; i++){
                const level = await Level.findById(levels[i]);
                resource.levels.push(level);
            }
        }

        if (subjects.length > 0) {
            for (let i = 0; i < subjects.length; i++){
                const subject = await Subject.findById(subjects[i]);
                subject.resources.push(resource._id);
                resource.subjects.push(subject);
                await subject.save();
            }
        }

        const savedResource = await resource.save();
        await user.resources.push(savedResource);
        await user.save();
        res.status(201).json(savedResource);

    } catch(err) {
        console.log(err.message);
        res.send({ error: err.message });
    }
});

router.get('/', (req, res) => {
    Resource.find({ approved: true })
    .populate("levels")
    .populate("subjects")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/disapproved', (req, res) => {
    Resource.find({ approved: false })
    .populate("levels")
    .populate("subjects")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/simple', (req, res) => {
    Resource.find({ approved: true })
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json({
            length: data.length,
            data
        });
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/admin/simple', (req, res) => {
    Resource.find()
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json({
            length: data.length,
            data
        });
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/pages/:page', (req, res) => {
    Resource.paginate({ approved: true }, { 
        page: req.params.page, 
        limit: 20, sort: '-created',
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
            {
                path: 'levels',
            },
            {
                path: 'subjects',
            }
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/approve/:page', (req, res) => {
    Resource.paginate({ approved: false }, { 
        page: req.params.page, 
        limit: 20, sort: '-created',
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
            {
                path: 'levels',
            },
            {
                path: 'subjects',
            }
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/admin/pages/:page', (req, res) => {
    Resource.paginate({}, { 
        page: req.params.page, 
        limit: 20, sort: '-created',
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
            {
                path: 'levels',
            },
            {
                path: 'subjects',
            }
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/random', (req, res) => {
    Resource.aggregate([
        { $sample: {size: 20} },
        { $lookup: {from: 'levels', localField: 'levels', foreignField: '_id', as: 'levels'} },
        { $lookup: {from: 'users', localField: 'creator', foreignField: '_id', as: 'creator'} },
        { $unwind: "$creator" },
        {
            $project: {
                creator: {
                    password: 0,
                    resources: 0,
                    accessLevel: 0,
                    posts: 0,
                    accountDeleted: 0,
                    userAccessLevel: 0
                }
            }
        },
    ])
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/:page', (req, res) => {
    const level = req.params.level;
    Resource.paginate({
        levels: { $all: level },
        approved: true
    }, { 
        page: req.params.page, 
        limit: 20, 
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
            {
                path: 'levels', 
            },
            {
                path: 'subjects',
            }
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/admin/level/:level/:page', (req, res) => {
    const level = req.params.level;
    Resource.paginate({
        levels: { $all: level },
    }, { 
        page: req.params.page, 
        limit: 20, 
        populate: [
            {
                path: 'creator',
                select: 'username email',
            },
            {
                path: 'levels', 
            },
            {
                path: 'subjects',
            }
        ],
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/subject/:subject/:page', (req, res) => {
    const subject = req.params.subject;
    Resource.paginate({
        subjects: { $all: subject },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/type/:page', (req, res) => {
    const type = req.query.type;
    Resource.paginate({
        resourceUse: type,
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/subject/:subject/:page', (req, res) => {
    const subject = req.params.subject;
    const level = req.params.level;
    Resource.paginate({
        subjects: { $all: subject },
        levels: { $all: level },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/subject/:subject/resource-type/:page', (req, res) => {
    const subject = req.params.subject;
    const level = req.params.level; 
    const type = req.query.type;

    Resource.paginate({
        subjects: { $all: subject },
        levels: { $all: level },
        resourceUse: type,
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/subject/:subject/query/:page', (req, res) => {
    const subject = req.params.subject;
    const level = req.params.level;
    const type = req.query.type;
    const q = req.query.q;

    Resource.paginate({
        subjects: { $all: subject },
        levels: { $all: level },
        resourceUse: type,
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/subject/:subject/search/:page', (req, res) => {
    const subject = req.params.subject;
    const level = req.params.level;
    const q = req.query.q;

    Resource.paginate({
        subjects: { $all: subject },
        levels: { $all: level },
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/subject/:subject/type/search/:page', (req, res) => {
    const subject = req.params.subject;
    const q = req.query.q;

    Resource.paginate({
        subjects: { $all: subject },
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/level/:level/search/:page', (req, res) => {
    const level = req.params.level;
    const q = req.query.q;

    Resource.paginate({
        levels: { $all: level },
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/subject/:subject/search/:page', (req, res) => {
    const subject = req.params.subject;
    const q = req.query.q;

    Resource.paginate({
        subjects: { $all: subject },
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/search/:page', (req, res) => {
    const q = req.query.q;

    Resource.paginate(
        {
            $text: { $search: q },
            approved: true
        },
        {
            score : { $meta: 'textScore' },
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        },
        { 
            page: req.params.page, 
            limit: 20, 
            sort: {
                score: { $meta : 'textScore' }
            },
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});

router.get('/type/search/:page', (req, res) => {
    const type = req.query.type;
    const q = req.query.q;

    Resource.paginate({
        resourceUse: type,
        $text: { $search: q },
        approved: true
    },
        { 
            page: req.params.page, 
            limit: 20, 
            populate: [
                {
                    path: 'creator',
                    select: 'username email',
                },
                {
                    path: 'levels', 
                },
                {
                    path: 'subjects',
                }
            ],
        }
    )
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).send(err);
    });
});


router.get('/:id', (req, res) => {
    Resource.findById(req.params.id)
    .populate("reviews")
    .populate("levels")
    .populate("subjects")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.get('/user/:id/:page', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        Resource.paginate({
            creator: user._id
        },
            { 
                page: req.params.page, 
                limit: 20, 
                populate: [
                    {
                        path: 'creator',
                        select: 'username email',
                    },
                    {
                        path: 'levels', 
                    },
                    {
                        path: 'subjects',
                    }
                ],
            }
        )
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
    } catch (e) {
        res.status(200).json({ error: e.message });
    }
});

router.get('/:id/user/:user', async (req, res) => {

    try {
        const resource = await Resource.findById(req.params.id);
        const user = await User.findById(req.params.user);

        if (resource.creator._id.toString() == user._id.toString()) {
            const data = await Resource.findOneAndDelete({ _id: req.params.id })
            res.status(200).json(data);
        } else {
            res.status(200).json({ error: 'You can only delete resources you own' });
        }
    } catch(e) {
        res.status(200).json({ error: e.message });
    }
});

router.delete('/:id', (req, res) => {
    Resource.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.get('/admin/delete/:id', (req, res) => {
    Resource.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.post('/edit/:id', (req, res) => {
    console.log(req.body);
    Resource.findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});


//Reviews
router.get('/:id/reviews', (req, res) => {
    Resource.findById(req.params.id)
    .select("reviews")
    .populate("reviews")
    .populate({
        path: 'creator',
        select: 'username email'
    })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

router.get("/disapprove/:id", async (req, res) => {
    try {
      let g = await Resource.update({ _id: req.params.id }, { $set: { approved: false } });
      res.status(200).json({
        status: "resource disapproved",
        data: g,
      });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  router.get("/approve-resource/:id", async (req, res) => {
    try {
      let g = await Resource.update({ _id: req.params.id }, { $set: { approved: true } });
      res.status(200).json({
        status: "resource approved",
        data: g,
      });
    } catch (e) {
      res.json({ error: e.message });
    }
  });


  router.get('/delete/:id', (req, res) => {
    Resource.findOneAndDelete({ _id: req.params.id })
    .then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(500).send(err);
    });
});

module.exports = router;