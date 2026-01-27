import {number, string, email,  pipe, boolean, object, InferOutput, any,} from "valibot"

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

 export const WeeklyClosingSchema = object({
    id: number(),
    barber: string(),
    totalGross: any(), 
    commission: any(),
    servicesCount: number(),
    archivedServiceIds: string(),
    createdAt: any()
})

export type WeeklyClosing = InferOutput<typeof WeeklyClosingSchema> 



// export const DateSchema = object({
//     id: number(),
//     service: string(),
//     price: any(),     // Cambiado a any porque llega como string "25.00"
//     barber: string(),
//     client: string(), 
//     phone: any(),     // Cambiado a any porque llega como string desde BIGINT
//     dateList: any(),  // Cambiado a any para aceptar null o strings de fecha
//     // Agregamos estos porque Sequelize los envía y Valibot puede quejarse si no los ve
//     createdAt: any(),
//     updatedAt: any(),
//     clientId: nullable(any())
//      })

//  export const DatesSchema = array(DateSchema)

 
// export type DateList = InferOutput<typeof DateSchema>

