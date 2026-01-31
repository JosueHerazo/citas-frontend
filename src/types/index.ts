import {number, string, email,  pipe, boolean, object, InferOutput, any,} from "valibot"

export const DraftRegisterSchema = object({
    name: string(),
    phone: number(),
    terms: boolean()
    // menssage:string
})

export const RegisterSchema = object({
    
    id: number(),
    name:   string(),
    password:  string(), 
    email: pipe(string(), email()),
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
// Noticias Schema
export const NewsSchema = object({
  description: string(),
  type: string(), // 'image' o 'video'
  url: string(),
  barberId: string() // Para saber quién lo subió
});

export type Register = InferOutput<typeof RegisterSchema>
export type DraftDate = InferOutput<typeof DraftDateSchema>     
export type DraftNews = InferOutput<typeof NewsSchema>  
export type WeeklyClosing = InferOutput<typeof WeeklyClosingSchema> 
export type DraftRegister = InferOutput<typeof DraftRegisterSchema>

