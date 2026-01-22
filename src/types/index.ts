import {number, string, email, any, pipe, boolean, object} from "valibot"

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
    price:  number(), 
    barber: string(),
    list: string(),

    // menssage:string
})
export const DateSchema = object({
            id: number(),
            service: string(),
            price: number(),
            barber: string(),
            list: any(),
            createdAt: number()
           
})

 

