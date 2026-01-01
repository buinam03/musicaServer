const { UserAchievement, User, Achievement } = require("../models/relationships");

const getAllUserArchievement = async (req, res) => {
  try {
    const { UserId } = req.body;

    const user = await User.findOne({
      where: { id: UserId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userAchievements = await UserAchievement.findAll({
      where: { userId: UserId }, // Sử dụng userId thay vì userid
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    if (userAchievements.length === 0) {
      return res.status(404).json({ message: "No userarchievement found" });
    }
    res.status(200).json({ data: userAchievements });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi lấy userArchievement ", error: error });
  }
};

const savedAchievementByUser = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.achievementId) {
      return res
        .status(400)
        .json({
          message: "Invalid input. Must provide userId and achievementId.",
        });
    }
    if (!Array.isArray(req.body.achievementId) || req.body.achievementId.length !== 4) {
      return res
        .status(400)
        .json({
          message: "Invalid input. Must provide exactly 4 achievementIds as an array.",
        });
    }

    const { userId, achievementId } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Kiểm tra tất cả achievementId có tồn tại không
    const achievements = await Achievement.findAll({
      where: {
        id: achievementId,
      },
    });

    if (achievements.length !== achievementId.length) {
      const foundIds = achievements.map((a) => a.id);
      const invalidIds = achievementId.filter((id) => !foundIds.includes(id));
      return res.status(400).json({
        message: "Some achievement IDs do not exist",
        invalidAchievementIds: invalidIds,
      });
    }

    const results = [];

    // Xử lý từng achievementId - vừa create vừa update được
    for (const achId of achievementId) {
      const [userAchievement, created] = await UserAchievement.findOrCreate({
        where: {
            userId: userId,
          achievement_id: achId,
        },
        defaults: {
          userId: userId,
          achievement_id: achId,
          achieved_at: new Date(),
        },
      });

      // Nếu đã tồn tại, cập nhật achieved_at
      if (!created) {
        userAchievement.achieved_at = new Date();
        await userAchievement.save();
      }

      results.push({
        achievement_id: achId,
        action: created ? "created" : "updated",
        data: userAchievement,
      });
    }

    res.json({
      message: "User achievements saved successfully",
      data: results,
      statusCode: 200,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when saving user achievement", error: error.message });
  }
};

module.exports = { getAllUserArchievement, savedAchievementByUser };
