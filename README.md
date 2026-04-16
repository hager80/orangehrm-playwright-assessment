## Execution Note
This test was configured to run serially on Chromium only.
Because the OrangeHRM public demo is a shared environment with mutable data, parallel multi-browser execution can cause record-count collisions when multiple test runs create/delete users at the same time.