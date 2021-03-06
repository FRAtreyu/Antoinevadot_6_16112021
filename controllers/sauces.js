const Sauce = require('../models/Sauce');
const fs = require('fs');
const xss = require('xss');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        name: xss(sauceObject.name),
        manufacturer: xss(sauceObject.manufacturer),
        description: xss(sauceObject.description),
        mainPepper: xss(sauceObject.mainPepper),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: '',
        usersDisliked: ''
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Objet enregistré !'}))
        .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Objet supprimé !'}))
                    .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(500).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.modifyLike = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            console.log(sauce);
            if (req.body.like === 1) {
                sauce.likes++;
                if (!sauce.usersLiked.includes(req.body.userId)) {
                    sauce.usersLiked.push(req.body.userId);
                }
            } else if (req.body.like === -1) {
                sauce.dislikes++;
                if (!sauce.usersDisliked.includes(req.body.userId)) {
                    sauce.usersDisliked.push(req.body.userId);
                }
            } else {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    sauce.likes--;
                    let position = sauce.usersLiked.indexOf(req.body.userId);
                    sauce.usersLiked.splice(position,1);
                }else{
                    sauce.dislikes--;
                    let position = sauce.usersDisliked.indexOf(req.body.userId);
                    sauce.usersDisliked.splice(position,1);
                }
            }
            sauce.save()
                .then(() => res.status(201).json({message: 'Objet enregistré !'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
}