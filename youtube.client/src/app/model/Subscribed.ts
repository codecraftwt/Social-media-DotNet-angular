export interface Subscribed {
    success: any;
    message(arg0: string, message: any): unknown;
    id: number; 
    userId:number;
    subscribeby:number;
}