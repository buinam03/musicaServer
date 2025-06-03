const express = require('express');
const router = express.Router();

router.get('/api/v1/insights', async (req, res) => {
    try {
        const { type, period } = req.query;
        
        // Xác định khoảng thời gian
        let startDate, endDate;
        const now = new Date();
        
        switch(period) {
            case 'day':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                endDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                endDate = new Date();
                break;
            case 'month':
                startDate = new Date(now.setDate(now.getDate() - 30));
                endDate = new Date();
                break;
            // Thêm các case khác...
        }

        // Query database dựa vào type
        let data;
        switch(type) {
            case 'plays':
                data = await TrackPlay.aggregate([
                    {
                        $match: {
                            played_at: { $gte: startDate, $lte: endDate }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%d/%m", date: "$played_at" } },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]);
                break;
            case 'likes':
                // Tương tự cho likes
                break;
            case 'comments':
                // Tương tự cho comments
                break;
        }

        // Format dữ liệu trả về
        const labels = data.map(item => item._id);
        const values = data.map(item => item.count);
        const total = values.reduce((a, b) => a + b, 0);

        res.json({
            success: true,
            data: {
                labels,
                values,
                total,
                period
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});