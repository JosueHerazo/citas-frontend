import {number, array, string, email,  pipe, boolean, object, type InferOutput, date} from "valibot"

export const DraftRegisterSchema = object({
    name: string(),
    password:  number(), 
    email: pipe(string(), email()),
    phone: number(),
    terms: boolean()
    // menssage:string
})

export const RegisterSchema = object({
   
    id: number(),
    name:   string(),
    email: string(),
    phone: number(),
    terms: boolean()
    // menssage:string
}) 

export const DraftDateSchema = object({
    service: string(),
    price: number(),
    barber: string(),
    dateList: date(),
    client: string(),
    phone: number(),  // Cambia date() por any() para evitar el error de parseo
     

    // menssage:string
})
export const DateSchema = object({
     id: number(),
    service: string(),
    price: number(),
    barber: string(),       
    dateList: date(),
    client: string(),
    phone: number(),   
           
})
 export const DatesSchema = array(DateSchema)

 
export type DateList = InferOutput<typeof DateSchema>

