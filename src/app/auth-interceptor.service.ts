import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

export class AuthInterceptorService implements HttpInterceptor{

    intercept(req:HttpRequest<any>,next: HttpHandler){
        console.log('request on way');
        const modifiedReq = req.clone({headers: req.headers.append('auth','xyz')});
        //return next.handle(req);

        return next.handle(modifiedReq);
    }

}
