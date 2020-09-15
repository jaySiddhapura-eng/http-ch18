# HTTP Requests

## Table of Contents  
* [Anatomy of HTTP Requests](#Anatomy-of-HTTP-Requests)<br>
* [Firebase as a Backend](#Firebase-as-a-Backend)<br>
* [Angular Client App](#Angular-Client-App)<br>

## Anatomy of HTTP Requests

​	[:arrow_up:](#Table-of-Contents )<br>

1. URL 
   1. Basically a rest end point
   2. Implemented on Backend
   3. REST end point is exposed to communicate to the backend
2. HTTP Verbs
   1. PUT, GET, POST etc
   2. defines which kind of request frontend want to send to the backend
3. Header (metadata)
   1. Some extra information append by the browser to the request
   2. Custom header can also append to the request
4. Body
   1. With some http verbs user can attach body to it
   2. eg. Post request

## Firebase as a Backend 

​	[:arrow_up:](#Table-of-Contents )<br>


1. Firebase login using google account
2. Create new project (add project)
3. Keep the default settings
4. Under **develop** sidebar select **database**
5. Select **Realtime Database** and choose **test mode**
6. The URL which appears in created DB will be the URL for backend API

## Angular Client App 

​	[:arrow_up:](#Table-of-Contents )<br>

1. Import HTTP Client Module in ```app.module.ts```

   ```typescript
   import { HttpClientModule } from '@angular/common/http';
   
   @NgModule({
     imports: [HttpClientModule]
   })
   ```

2. Import HTTP Client in ```app.component.ts```

   ~~~typescript
   import { HttpClient } from '@angular/common/http';
   
   export class AppComponent implements OnInit {
       // injecting http dependency in constructor
       constructor(private http: HttpClient) {}
   }
   
   // the client will be further be used with the name 'http'
   ~~~

3. Performing Post request to the backend

   ~~~typescript	
   export class AppComponent implements OnInit {
     postURL : string = 'firebaseURL/posts.json';
       
     constructor(private http: HttpClient) {}
       
     // this method get executed from html form templet
     // also object is transformed from html templet
     onCreatePost(postData: { title: string; content: string }) {
       this.http.post(this.postURL,postData).subscribe(
         responseData => {
           console.log(responseData);
         	}
       );
     }
     // subscription is necessary to post the data
     // no need to unsubscribe though, angular do it automatically
   }
   ~~~

4. Fetching the data from backend

   ~~~typescript
   // A private fetching method which will be used in various methods
   private fetchPost(){
     this.http.get(this.postURL).subscribe(
        posts => {
           console.log(posts);
        }
      );
   }
   // execute the fetchpost method when the component get initialized
   ngOnInit() {
     this.fetchPost();
   }
   // another methods uses the fetchPost method
   onFetchPosts() {
     this.fetchPost();
   }
   ~~~

5. Converting the fetched data using pipe operator

   ~~~typescript
   private fetchPost(){
     this.http.get(this.postURL).pipe(map(responseData => {
          const postArray = []; // converting javascript object to an array
          for(const keys in responseData){	// iterate over the responded data
              if(responseData.hasOwnProperty(keys))	// check the presence of key in response
              postArray.push({...responseData[keys], id:keys});// push the responded data 
          }
          return postArray;	// return the array from pipe operator
          })).
          subscribe(
         	posts => {		   // this posts arrived from the pipe operator
           	console.log(posts);
         	}
          );
     }
   ~~~

6. Providing data type in post and get method

   ~~~typescript
   // <{name:string}> is datatype of the response from post method
   this.http.post<{name:string}>(this.postURL,postData).subscribe(
       responseData => {		// data will be name:string
           console.log(responseData);
         }
   );
   
   //<{[key:string]:Post}> is datatype of response of get request
   this.http.get<{[key:string]:Post}>(this.postURL). 
       pipe(map(responseData => {	//data will be [key:string]:Post
       	const postArray:Post[] = [];
         	for(const keys in responseData){
             if(responseData.hasOwnProperty(keys))
             postArray.push({...responseData[keys], id:keys});
         	}
         	return postArray;
       })).
       subscribe(
         posts => { 	////data will be [key:string]:Post
           console.log(posts);
         }
       );
   ~~~

7. Showing the obtained post on HTML space

   ~~~html
    <p *ngIf="loadedPosts.length < 1">No posts available!</p>
    <ul  *ngIf="loadedPosts.length >= 1">
       <li *ngFor="let post of loadedPosts">
          <h3>{{ post.title }}</h3>
          <p>{{ post.content }}</p>
       </li>
   </ul>
   ~~~

8. Adding loading indicator

   ~~~typescript
   app.component.ts
   
   // add fetching variable in the code
   fetching: boolean = false;
   
   // make this variable true when fetching started and make it false when fetching finished
   private fetchPost(){
       this.fetching = true;	// fetching activated
       this.http.get<{[key:string]:Post}>(this.postURL).
       
       pipe(map(responseData => {
         const postArray:Post[] = []; 
         for(const keys in responseData){
             if(responseData.hasOwnProperty(keys))
             postArray.push({...responseData[keys], id:keys});
         }
         return postArray;
       })).
       
       subscribe(
         posts => {
           this.loadedPosts = posts;
           this.fetching = false;	// fatching deactivated
         }
       );
     }
   ~~~

9. Separating the http logic in new service

   ```posts.service.ts```

   ~~~typescript
   @Injectable({
       providedIn:'root'})
   export class PostService{
     postURL : string = 'https://recipe-book-backend-850d4.firebaseio.com/posts.json';
     lp:Post[] = [];
       
     // injecting http client dependency
     constructor(private http: HttpClient) {}
       
     // method responsible for http post request
     createAndStorePosts(postData:Post){
         let response:any;
           this.http.post<{name:string}>(this.postURL,postData).subscribe(
               responseData => {	// this is just the firebase generated id
                 response = responseData;
               }
             );
     }
       
     // method responsible for http get request
     fetchPosts(){ // no subscription here
          return this.http.get<{[key:string]:Post}>(this.postURL).
           		  pipe(map(responseData => {
             				const postArray:Post[] = []; 
             				for(const keys in responseData){
                 				if(responseData.hasOwnProperty(keys)){
                  	 			postArray.push({...responseData[keys], id:keys});
                 				}
             				}
             				return postArray;
           			}
          			));
     }
   }    
   ~~~

   ```app.component.ts```

   ~~~typescript
   constructor(private postSer:PostService) {}
   
   ngOnInit() {	// calling the private fetch method
     this.exFetchPost();
   }
   
   onFetchPosts() {	// calling the private fetch method
     this.exFetchPost();
   }
   
   onCreatePost(postData: Post) {	// calling the service post method
     this.postSer.createAndStorePosts(postData);
   }
   
   private exFetchPost(){	// calling the service get method
     this.fetching = true;
     this.postSer.fetchPosts().subscribe(	// subscription happen here
       post => {
         this.fetching = false;
         this.loadedPosts = post;
       }
     );
   }
   ~~~

10. Delete all the posts

    ```post.service.ts```

    ~~~typescript
    deletePosts(){
         return this.http.delete(this.postURL);
    }
    ~~~

    ```app.component.ts```

    ~~~typescript
    onClearPosts() {
        this.postSer.deletePosts().subscribe(
          () => {
           this.loadedPosts = [];
          }
        );
    }
    ~~~

11. Error handling

    ```app.component.ts```

    ~~~typescript
    error = null;
    
    private exFetchPost(){
      this.fetching = true;
        
      this.postSer.fetchPosts().subscribe(
          post => {
            this.fetching = false;
            this.loadedPosts = post;
    
          }, 
          error => {	// multiple functions can be added in subscribe method
            this.error = error.error.error;
            console.log(this.error);
          }
        );
    }
    ~~~

    ```app.component.html```

    ~~~html
    <div *ngIf ="fetching && !error" class="loader" ></div>
    
    <div *ngIf="error" class="alert alert-danger">
           <h4>Error Occured</h4>
           <p>{{error}}</p>
    </div>
    ~~~

12. Subject based error handling technique

    Create subject in ```post.service.ts``` file

    ~~~typescript
    errorMessage = new Subject<any>();
    // a method which performs the post request
    createAndStorePosts(postData:Post){
        let response:any;
        this.http.post<{name:string}>(this.postURL,postData).subscribe(
            responseData => {
               response = responseData;  
               console.log(response);
            },
            error => {
               this.errorMessage.next(error);	// send the occured message on subject
            }
        );
    }
    ~~~

    Subscribe to the subject in ```app.component.ts```

    ```typescript
    errorMessageSubscription:Subscription;
    
    onCreatePost(postData: Post) {
     	this.postSer.createAndStorePosts(postData);
     	this.errorMessageSubscription = this.postSer.errorMessage.subscribe(
          							 	error => {
            								this.error = error.error.error;
          							 	}
        						   	   );
    }
    // unsubscribing the subject when distroying the subject
    ngOnDestroy(){
        this.errorMessageSubscription.unsubscribe();
    }
    ```

13. Adding header

    ~~~typescript
    import { HttpHeaders } from '@angular/common/http';
    
    // header is appended to any http request
    this.http.get<{[key:string]:Post}>(this.postURL,
                {   // header stuff here
                    headers:new HttpHeaders({'my-header': 'hello'})
                })
    ~~~

14. Adding parameters in the http request

    ```posts.service.ts```

    ~~~typescript
    this.http.get<{[key:string]:Post}>(this.postURL,
                {   
                    headers:new HttpHeaders({'my-header': 'hello'}),
                	// single param can be added as follow
                    params: new HttpParams ().set('print','pretty')
                })
    ~~~

    Multiple params can be added as follow

    ~~~typescript
    // http param variable is immutable therefore 
    // after appending you need to overwrite the param as follow
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print','pretty');
    searchParams = searchParams.append('custom','key');
    
    this.http.get<{[key:string]:Post}>(this.postURL,
           {   // header stuff here
               headers:new HttpHeaders({'my-header': 'hello'}),
               // multiple params are added as follow`
               params: searchParams
                })
    ~~~

15. Obtain full response from server 

    ~~~typescript
    this.http.get<{[key:string]:Post}>(this.postURL,
            { 
              headers:new HttpHeaders({'my-header': 'hello'}),
              params: searchParams,
        	 // full response is obtained as follow
              observe: 'response'
            })
        	.pipe(map(responseData => {
                		console.log(responseData);	// full response on the log
    				   }
    ~~~

16. Interceptors

    Interceptors are piece of code which get executed before every HTTP requests

    Interceptors are useful while performing client authentication to access API

    Create the Intercepter

    ```auth-intercepter.service.ts```

    ~~~typescript
    import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
    
    export class AuthInterceptorService implements HttpInterceptor{
        intercept(req:HttpRequest<any>,next: HttpHandler){
            console.log('request on way');
            return next.handle(req);
        }
    }
    ~~~

    Registering the Intercepter in ```app.module.ts```

    ~~~typescript
    @NgModule({
         providers: [
                  		{ provide:HTTP_INTERCEPTORS, 
                    	useClass: AuthInterceptorService, 
                   		multi:true
                 		}
                 	],
       		 })
    ~~~

17. Manipulating Request object using Intercepter

    ```auth-interceptor.service.ts```

    ~~~typescript
    import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
    
    export class AuthInterceptorService implements HttpInterceptor{
        intercept(req:HttpRequest<any>,next: HttpHandler){
            // inputed request is being modified
            const modifiedReq = req.clone({headers: req.headers.append('auth','xyz')});
            // modified request is being outputed from interceptor
            return next.handle(modifiedReq);
        }
    }
    // requests are imutable therefore modification is done as above
    // other modifications such as header, parameters can also be changed usign this method
    ~~~

    


