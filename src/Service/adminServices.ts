import User, { IUserDocument } from "../Model/userModel";

export const updateUser = async (
  userId: string,
  updateData: Partial<IUserDocument>
): Promise<IUserDocument | null> => {
  try {
    delete updateData.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    return user;
  } catch (error) {
    throw new Error(`Failed to update user: ${(error as Error).message}`);
  }
};

export const toggleBlockUser = async (
  userId: string
): Promise<IUserDocument | null> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    const newBlockStatus = !user.isBlocked;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked: newBlockStatus } },
      { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
  } catch (error) {
    throw new Error(
      `Failed to toggle block status: ${(error as Error).message}`
    );
  }
};


export const deleteUserService = async (userId: string): Promise<IUserDocument | null> => {
  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (error) {
    throw new Error(`Failed to delete user: ${(error as Error).message}`);
  }
};