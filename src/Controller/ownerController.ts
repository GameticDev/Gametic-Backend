
import { Request, Response } from "express";
import { CustomError } from "../utils/customError";
import { deleteTurfService, editTurfService, turfService } from "../Service/ownerService";
import Turff from "../Model/turfModel";
import { Booking } from "../Model/bookingModel";
import { asyncErrorhandler } from "../Middleware/asyncErrorHandler";
import User from "../Model/userModel";


export const createTurf = asyncErrorhandler(async (req: Request, res: Response) => {
    const data = req.body;
    const files = req.files as Express.Multer.File[];
    
    // Parse availability if it was sent as JSON string
  if (data.availability) {
    try {
      data.availability = JSON.parse(data.availability);
    } catch (err) {
      throw new CustomError('Invalid availability format', 400);
    }
  }
  
    // Required fields check
    const requiredFields = ['name', 'city', 'area', 'location', 'turfType', 'hourlyRate'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        throw new CustomError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    if (!files || files.length === 0) {
        throw new CustomError("No images uploaded", 400);
    }

    const imageUrls = files.map(file => file.path);
    
    const newTurf  = await Turff.create({
        ...data,
        images: imageUrls,
        status: 'active'
    });
    // .populate('ownerId');
    
    return res.status(201).json({
        message: "Turf added successfully",
        // turf
        turf: newTurf 
    });
});


export const getAllturf = asyncErrorhandler(async (req: Request, res: Response) => {
  const ownerId = req.query.ownerId as string | undefined;
  const category = req.query.category as string | undefined;
  const time = req.query.time as string | undefined;
  const search = req.query.search as string | undefined;

  const page = parseInt(req.query.page as string) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const filter: any = {
    ...(ownerId && { ownerId }),
    isDelete: false,
  };

  if (category) {
    filter.turfType = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  if (time) {
    filter["availability.timeSlots"] = time;
  }

  const allTurf = await Turff.find(filter)
    .skip(skip)
    .limit(limit)
//     .populate({
//   path: "bookings",
//   populate: { path: "userId", select: "name email phone picture" ,}
// })
.populate({
  path: "bookings.userId",
  select: "name email phone picture"
})

    

  const total = await Turff.countDocuments(filter);

  if (allTurf.length > 0 && allTurf[0].bookings?.length > 0) {
    console.log('Sample populated booking:', {
      turfId: allTurf[0]._id,
      bookingUserId: allTurf[0].bookings[0].userId
    });
  }

  return res.status(200).json({
    message: "Turf details fetched successfully",
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    turf: allTurf,
     totalCount: total,
  });
});



export const deleteTurf=asyncErrorhandler(async(req:Request,res:Response)=>{
    const{id}=req.params;
    if(!id){
        throw new CustomError("id not found",404)
    }
    const Turf=await deleteTurfService(id)

    return res.status(200).json({
        message:"Turf deleted successfully",
        Turf
    })
})


export const editTurf = asyncErrorhandler(async(req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!id) {
        throw new CustomError("Turf ID not found", 404);
    }

    // Parse the incoming data
    const updateData: any = {
        ...data,
        // Parse availability if it's sent as string
        availability: typeof data.availability === 'string' 
            ? JSON.parse(data.availability) 
            : data.availability
    };

    // Handle uploaded files
    if (files && files.length > 0) {
        updateData.images = files.map(file => file.path); // Cloudinary URL is in file.path
    }

    // Handle existing images if provided
    if (data.existingImages) {
        try {
            const existing = JSON.parse(data.existingImages);
            updateData.images = [
                ...(Array.isArray(existing) ? existing : [existing]),
                ...(updateData.images || [])
            ];
        } catch (e) {
            console.error('Error parsing existing images', e);
            // Continue without existing images if parsing fails
        }
    }

    const turf = await editTurfService(id, updateData);

    return res.status(200).json({
        success: true,
        message: "Turf updated successfully",
        turf
    });
});

export const turfById=asyncErrorhandler(async(req:Request,res:Response)=>{

    const{id}=req.params;
    if(!id){
        throw new CustomError("id not found",404)
    }
    const Turf=await Turff.findById(id)
    return res.status(200).json({
        message:"single turff fetched successfully",
        Turf
    })
})



export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          phone: req.body.phone,
          location: req.body.location,
          bio: req.body.bio,
          businessName: req.body.businessName
        },
      },
      { new: true }
    );

     if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

   res.status(200).json({ user: updatedUser });

  } catch (err: any) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

export const updateBookingStatus = asyncErrorhandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log('Received status update:', { id, status });

  if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    console.log('Invalid status value:', status);
    throw new CustomError("Invalid status value", 400);
  }

  // Update booking inside Turf's bookings array using positional operator $
  const turf = await Turff.findOneAndUpdate(
    { "bookings._id": id },
    { $set: { "bookings.$.status": status } },
    { new: true }
  // ).populate("bookings.userId"); 
  ).populate("bookings.userId", "name email phone picture");


  if (!turf) {
    console.log("Booking not found for id:", id);
    throw new CustomError("Booking not found", 404);
  }
 console.log('Booking updated:', turf);

  const updatedBooking = turf.bookings.find(b => b.id.toString() === id);
  console.log('Updated booking with user:', {
    status: updatedBooking?.status,
    user: updatedBooking?.userId
  });

  return res.status(200).json({
    message: "Booking status updated successfully",
    turf,
  });
});