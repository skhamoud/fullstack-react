const router = require('express').Router();
const sgMail = require('@sendgrid/mail');
const Survey = require('../models/Survey');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');

sgMail.setApiKey(require('../config/keys').sendGridKey);

router.get('/api/surveys', requireLogin, async (req, res) => {
  try {
    const surveys = await Survey.find({ _user: req.user.id });
    res.send(surveys);
  } catch (err) {
    res.status(400).send({ err });
  }
});

router.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
  const {
    title, subject, body, recipients,
  } = req.body;

  const survey = new Survey({
    title,
    body,
    subject,
    recipients: recipients.split(',').map(email => ({ email: email.trim() })),
    _user: req.user.id,
    dateSent: Date.now(),
  });

  const msg = {
    to: survey.recipients.map(({ email }) => email),
    from: 'skhamoud@gmail.com',
    subject,
    text: body,
    html: surveyTemplate(survey),
  };

  try {
    await sgMail.sendMultiple(msg);
    const newSurvey = await survey.save();

    req.user.credits -= 1;

    const user = await req.user.save();

    res.send({ user, survey: newSurvey });
  } catch (err) {
    res.status(422).send({ error: err });
  }
});

router.get('/api/surveys/thanks', (req, res) => {
  res.send('<h2> Thank you for your Feedback </h2>');
});

module.exports = router;