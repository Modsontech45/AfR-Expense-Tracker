-Make it so it can send email to reviewers on update
    - The way to achive this can be by using jwt to authenticate and verify email nkeeping
    - try keepin the app.script as the backend
    - 

On dat entry send a email to the reviewers in reviewers array and there will be a link to verify, it will use hash, it will hash the email and put it into the link that redirects to the webvsite(frontend) se.g /frontend?tokan=HASHED_REVIEWER_EMAIL
now when they wnat to review the token is sent, dehashed by the script to check if the deshaed value which is an email, exist in the revieveer array or token is provided, if not throw a reasonable and proper error for both situation, if all validation n is passed, set reviewed column for that data to the dehashed value which will be an email, so if reviwer1 is empty sets reviewer 1 to the email sent(in dehashed value) else reviever2 else says it has been reviewed by both party