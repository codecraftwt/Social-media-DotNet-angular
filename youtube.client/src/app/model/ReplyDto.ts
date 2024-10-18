export interface ReplyDto {
    id?: number;       
    commentId : number;
    userId:number;
    replyText:string;
    replyVisible?: boolean;
    likes:number;
    dislikes:number;
  }