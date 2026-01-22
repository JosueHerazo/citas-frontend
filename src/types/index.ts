import {number, optional, array, string, email, any, pipe, boolean, object} from "valibot"

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
    client: optional(string()), 
    phone: optional(any()), // A veces el número llega como string o number
    date: optional(string()), 
    list: optional(any()),  // Cambia date() por any() para evitar el error de parseo
    createdAt: any()

    // menssage:string
})
export const DateSchema = object({
               id: number(),
    service: string(),
    price: number(),
    barber: string(),
    client: optional(string()), 
    phone: optional(any()), // A veces el número llega como string o number
    date: optional(string()), 
    list: optional(any()),  // Cambia date() por any() para evitar el error de parseo
    createdAt: any()
           
})
 export const DatesSchema = array(DateSchema)

 

