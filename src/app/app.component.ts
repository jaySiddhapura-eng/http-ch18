import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators'; // get some data and return the modified data

import {Post} from './post.model';
import { PostService } from './posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loadedPosts:Post[] = [];
  postURL : string = 'https://recipe-book-backend-850d4.firebaseio.com/posts.json';
  fetching: boolean = false;
  error:string = null;
  errorMessageSubscription:Subscription;


  constructor(private postSer:PostService) {}

  ngOnInit() {
    this.exFetchPost();
  }

  onCreatePost(postData: Post) {

    this.postSer.createAndStorePosts(postData);
    this.errorMessageSubscription = this.postSer.errorMessage.subscribe(
      error => {
        this.error = error.error.error;
        
      }
    );
   
    // let response:any;
    // this.http.post<{name:string}>(this.postURL,postData).subscribe(
    //     responseData => {
    //       response = responseData;  
    //       console.log(response);
    //     }
    //   );
  }

  onFetchPosts() {
    // Send Http request
    this.exFetchPost();
  }

  onClearPosts() {
    this.postSer.deletePosts().subscribe(
      () => {
       this.loadedPosts = [];
      }
    );
    // Send Http request
  }

  private exFetchPost(){
    this.fetching = true;
    this.postSer.fetchPosts().subscribe(
      post => {
        this.fetching = false;
        this.loadedPosts = post;

      }, 
      error => {
        this.error = error.error.error;
        console.log(this.error);
        this.fetching = false;
      }
    );
  }

  onClearError(){
    this.error = null;
  }

  ngOnDestroy(){
    this.errorMessageSubscription.unsubscribe();
  }

}
