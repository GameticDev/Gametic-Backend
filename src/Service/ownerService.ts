import Turff ,{TurffData}from "../Model/turfModel";


export const turfService=async(data:TurffData,filepaths:string[]):Promise<TurffData>=>{

    const{ownerId,name,city,area,location,turfType,size,images,hourlyRate,availability,status}=data

    const newTurf=new Turff({
          ownerId,
        name,
        city,
        area,
        location,
        turfType,
        size,
        images:filepaths,
        hourlyRate,
        availability,
      
        status
    })
  const savedTurf=await newTurf.save()
  return savedTurf;
}




export const editTurfService=async(id:string,data:TurffData)=>{

  const updateData=await Turff.findByIdAndUpdate(id,{$set:{...data,isDelete:false}},{new:true})

  return updateData;
}


export const deleteTurfService=async(id:string)=>{

  return await Turff.findByIdAndUpdate(id,{isDelete:true},{new:true})
}


