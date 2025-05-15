import Turff, { TurffData } from "../Model/turfModel"


export const turfService=async(data:TurffData,filepaths:string[]):Promise<TurffData>=>{

    const{name,city,area,address,turfType,size,image,hourlyRate,status}=data

    const newTurf=new Turff({
        // ownerId,
        name,
        city,
        area,
        address,
        turfType,
        size,
        image:filepaths,
        hourlyRate,
        status
    })
  const savedTurf=await newTurf.save()
  return savedTurf;
}