const { User, Follows } = require("../models/relationships");
const NotificationService = require("../service/notificationservice");
const { Op } = require("sequelize");

const getAllFollow = async (req, res) => {
  try {
    const follow = await Follows.findAll();
    if (follow.length === 0) {
      return res.status(404).json({ message: "No follow found" });
    }
    res.json(follow);
  } catch (error) {
    res.status(500).json({ message: "Error when get follow" });
  }
};

const getFollowerById = async (req, res) => {
  try {
    const id = req.user.id;
    const userId = req.params.id;
    console.log(userId);

    const result = await Follows.findOne({
      where: {
        follower_id: id,
        following_id: userId,
      },
    });
    res.status(200).json({ message: "Success", data: result });
  } catch (error) {
    res.status(500).json({ message: "Error when get follow", error: error });
  }
};

const addNewFollower = async (req, res) => {
  try {
    const id = req.user.id;
    console.log(id);
    const { following_id } = req.body;

    const existingFollow = await Follows.findOne({
      where: {
        follower_id: id,
        following_id: following_id,
      },
    });
    if (existingFollow) {
      await Follows.destroy({
        where: {
          follower_id: id,
          following_id: following_id,
        },
      });

      const result = await Follows.findAll({
        where: { follower_id: id },
      });

      return res
        .status(200)
        .json({ message: "Unfollowed successfully", data: result });
    } else {
      await Follows.create({
        follower_id: id,
        following_id: following_id,
      });
      const username = await User.findOne({
        where: { id: id },
      });
      await NotificationService(
        following_id,
        "follow",
        `${username.username} is now following you.`,
        `/user/${id}`
      );
      const result = await Follows.findAll({
        where: { follower_id: id },
      });

      return res
        .status(201)
        .json({ message: "Followed successfully", data: result });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when follow someone", error: error });
  }
};

const getAllFollower = async (req, res) => {
  const { ids } = req.query;

  if (!ids || typeof ids !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu hoặc sai định dạng tham số 'ids'",
      example: "/follows/getAllFollower?ids=1,2,3",
    });
  }

  try {
    const followers = await Follows.findAll({
      where: { following_id: ids },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "username", "profile_picture"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: followers.length,
      data: followers,
    });
  } catch (error) {
    console.error("[SERVER ERROR]", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const getAllFollowing = async (req, res) => {
  const { id } = req.query;
  const currentUserId = req.user.id;
  try {
    const result = await Follows.findAll({
      where: { follower_id: id },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "profile_picture"],
        },
      ],
    });

    if (result.length > 0) {
      // Get all following user IDs
      const followingIds = result.map(item => item.following.id);
      
      // Check if current user follows these users
      const currentUserFollows = await Follows.findAll({
        where: {
          follower_id: currentUserId,
          following_id: followingIds,
        },
        attributes: ['following_id']
      });

      // Create a Set for quick lookup
      const currentUserFollowIds = new Set(currentUserFollows.map(follow => follow.following_id));

      // Map result with isFollow status
      const dataWithFollowStatus = result.map(item => {
        const itemData = item.toJSON();
        return {
          ...itemData,
          following: {
            ...itemData.following,
            isFollow: currentUserFollowIds.has(itemData.following.id)
          }
        };
      });

      res.status(200).json({
        success: true,
        message: "Success",
        count: dataWithFollowStatus.length,
        data: dataWithFollowStatus,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "You have 0 following",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error when get following",
      error: error,
    });
  }
};

const getCountFollower = async (req, res) => {
  try {
    const { id } = req.query;

    const count = await Follows.count({
      where: { following_id: id },
    });

    res.status(200).json({ message: "Success", data: count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when follow someone", error: error });
  }
};

const getCountFollowing = async (req, res) => {
  try {
    const { id } = req.query;

    const count = await Follows.count({
      where: { follower_id: id },
    });

    res.status(200).json({ message: "Success", data: count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error when follow someone", error: error });
  }
};

const searchFollowers = async (req, res) => {
  try {
    const { username, id } = req.query;

    const followers = await Follows.findAll({
      where: {
        following_id: id,
      },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "username", "profile_picture"],
          where: {
            username: {
              [Op.like]: `%${username}%`,
            },
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Success",
      count: followers.length,
      data: followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error when searching followers",
      error: error,
    });
  }
};

const searchFollowing = async (req, res) => {
  try {
    const { username, id } = req.query;

    const following = await Follows.findAll({
      where: {
        follower_id: id,
      },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "profile_picture"],
          where: {
            username: {
              [Op.like]: `%${username}%`,
            },
          },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Success",
      count: following.length,
      data: following,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error when searching following",
      error: error,
    });
  }
};

const getFollowStatus = async (req, res) => {
  try {
    const { user_id } = req.query;
    const currentUserId = req.user.id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: user_id",
      });
    }

    const followerList = await Follows.findAll({
        where: {
          following_id: user_id, 
        },
        include: [
          {
            model: User,
            as: "follower", 
            attributes: ["id", "username", "profile_picture"],
          },
        ],
      });

    // Get all follow relationships where current user follows the followers
    const followerIds = followerList.map(item => item.follower.id);
    
    // Check if user_id follows back the followers (isFollowing)
    const userFollowingBack = await Follows.findAll({
      where: {
        follower_id: user_id,
        following_id: followerIds,
      },
      attributes: ['following_id']
    });

    // Check if current user follows the followers (isFollowed)
    const mutualFollows = await Follows.findAll({
      where: {
        follower_id: currentUserId,
        following_id: followerIds,
      },
      attributes: ['following_id']
    });

    // Create Sets for quick lookup
    const userFollowingBackIds = new Set(userFollowingBack.map(follow => follow.following_id));
    const mutualFollowIds = new Set(mutualFollows.map(follow => follow.following_id));
  
      const result = followerList.map(item => ({
        id: item.follower.id,
        username: item.follower.username,
        profile_picture: item.follower.profile_picture,
        isFollowing: userFollowingBackIds.has(item.follower.id),
        isFollowed: mutualFollowIds.has(item.follower.id),
      }));
  
      return res.status(200).json({
        success: true,
        message: "Get follower list successfully",
        data: result,
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error when checking follow status",
      error: error,
    });
  }
};

module.exports = {
  getFollowerById,
  getAllFollow,
  getAllFollower,
  getAllFollowing,
  addNewFollower,
  getCountFollower,
  getCountFollowing,
  searchFollowers,
  searchFollowing,
  getFollowStatus,
};
