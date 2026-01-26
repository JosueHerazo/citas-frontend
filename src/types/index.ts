import {number, array, string, email,  pipe, boolean, object, type InferOutput, any, nullable} from "valibot"

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
    client: string(),
    phone: number(),  // Cambia date() por any() para evitar el error de parseo
    dateList: string(),
         })
export const DateSchema = object({
      id: number(),
    service: string(),
    price: number(),
    barber: string(),
    client: string(),   
    phone: number(),
    createdAt: any(), // IMPORTANTE: Sequelize siempre lo envía
    updatedAt: any(), // IMPORTANTE: Sequelize siempre lo envía
    clientId: nullable(any()),     
    dateList: string()
     })

 export const DatesSchema = array(DateSchema)

 
export type DateList = InferOutput<typeof DateSchema>

