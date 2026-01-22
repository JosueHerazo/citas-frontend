import {number, string, email, pipe, boolean, object, date} from "valibot"

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
    date: string(),

    // menssage:string
})

 

