import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEventType } from '@angular/common/http';
import { OnInit } from '@angular/core';

import {Post} from './post.model';
import { map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class PostService{

    postURL : string = 'https://recipe-book-backend-850d4.firebaseio.com/posts.json';
    lp:Post[] = [];

    // error subject
    errorMessage = new Subject<any>();


    constructor(private http: HttpClient) {}

    createAndStorePosts(postData:Post){
        let response:any;
        this.http.post<{name:string}>(this.postURL,postData).subscribe(
            responseData => {
              response = responseData;  
              console.log(response);
            },
            error => {
                this.errorMessage.next(error);
            }
          );
    }


    fetchPosts(){
        let searchParams = new HttpParams();
        searchParams = searchParams.append('print','pretty');
        searchParams = searchParams.append('custom','key');
        return this.http.get<{[key:string]:Post}>(this.postURL,
            {   // header stuff here
                headers:new HttpHeaders({'my-header': 'hello'}),
                //params: new HttpParams ().set('print','pretty')
                params: searchParams,
               // observe: 'response'
            }).
        pipe(map(responseData => {
            console.log(responseData);
          // converting javas+cript object to an array
          const postArray:Post[] = []; // holds the converted javascript to array object 
          for(const keys in responseData){
              if(responseData.hasOwnProperty(keys)){
                postArray.push({...responseData[keys], id:keys});
              }
          }
          return postArray;
        }
       ));
    }

    deletePosts(){
        return this.http.delete(this.postURL,  
            {
                observe:'events'
            }).pipe(
                tap(event  => {
                    console.log(event);
                    if(event.type === HttpEventType.Sent){
                        //...
                    }
                    if(event.type===HttpEventType.Response){
                        console.log(event.body);
                    }
                }));
    }
}