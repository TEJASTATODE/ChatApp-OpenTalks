const router = require('express').Router();
const PrivateMessage = require('../models/PrivateMessage');
const privateMessageController = require('../controllers/privateMessageController');

router.post('/save', privateMessageController.saveMessage);

router.get('/between/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
