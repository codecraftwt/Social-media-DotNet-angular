import { ReplyDto } from "./ReplyDto";

export interface CommentDto {
    id: number;       
    videoId: number;
    userId: number;
    comment: string;
    likes : number;
    dislikes:number;
    replies?: ReplyDto[];
}
  