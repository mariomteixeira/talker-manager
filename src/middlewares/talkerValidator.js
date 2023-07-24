const talkerValidator = (response, talker, next) => {
    if (!talker) {
        response.status(400).json({ next });
        return false;
    }
    return true;
};

const watchDate = (res, watchedAt) => {
    const format = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/i;
    if (!format.test(watchedAt)) {
        res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
        return false;
    }
    return true;
};

const rateValidator = (res, rate) => {
    if (rate === undefined) {
        res.status(400).json({ message: 'O campo "rate" é obrigatório' });
        return false;
    }
    if (!Number.isInteger(rate) || rate < 1 || rate > 5) {
        res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
        return false;
    }
    return true;
};

const talkValidator = (req, res, next) => {
    const { talk } = req.body;
    if (!talkerValidator(res, talk, 'O campo "talk" é obrigatório') 
    || !talkerValidator(res, talk.watchedAt, 'O campo "watchedAt" é obrigatório') 
    || !watchDate(res, talk.watchedAt) 
    || !rateValidator(res, talk.rate)) {
        return;
    }
    next();
};

module.exports = talkValidator;
