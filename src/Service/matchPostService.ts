import Match, { MatchPost } from "../Model/matchPostModel";


export const matchPostService=async(data:MatchPost)=>{

    const{userId,title,sports,maxPlayers,joinedPlayers,turfId,date,startTime,endTime,paymentPerPerson,location,status}=data

    const newPost=new Match({
        userId,
        title,
        sports,
        maxPlayers,
        joinedPlayers,
        turfId,
        date,
        startTime,
        endTime,
        paymentPerPerson,
        location,
        status
    })

    return await newPost.save()

}