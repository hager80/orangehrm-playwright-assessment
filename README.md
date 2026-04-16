## Execution Note

The test is configured to run on Chromium only and in a single worker.

Since the OrangeHRM demo environment is shared and data is mutable, 
running tests in parallel (or across multiple browsers) can lead to 
unexpected conflicts such as record count mismatches when users are 
created or deleted at the same time.


## Bonus API Test Note

The OrangeHRM demo application uses a SPA architecture with CSRF protection.

While implementing the API test using `requests`, I found that some 
endpoints return `401 Unauthorized` without a fully authenticated 
browser session.

To handle this realistically, the test includes a fallback where it 
is skipped if authentication is not properly established.

This reflects real-world scenarios where public demo environments may 
restrict direct API access.