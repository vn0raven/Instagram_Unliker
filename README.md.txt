Instagram Bulk Unlike Script
============================

This is a JavaScript tool to help you unlike posts on the web version of Instagram. 

It automates the boring process of clicking "Select," picking photos, and clicking "Unlike." It includes a few checks to make sure it doesn't go too fast (waits for the loading spinner to disappear) and tries to fix itself if the scrolling gets stuck.

WHAT IT DOES
------------
- Selects posts in batches (default is 50).
- Waits for Instagram to finish "Deleting..." before starting the next batch.
- Scrolls up and down if the "Select" button or photos aren't loading.
- Clicks "Cancel" if the menu gets stuck.

HOW TO USE
----------
1. Log in to Instagram on your computer.
2. Go to your likes page: https://www.instagram.com/your_activity/interactions/likes
3. Make sure your Instagram language is set to English.
4. Open the Developer Console:
   - Windows: F12 or Ctrl + Shift + J
   - Mac: Cmd + Option + J
5. If you see a warning about pasting code, type "allow pasting" and hit Enter.
6. Copy the code from 'instagram-unliker.js' and paste it into the console.
7. Press Enter to run it.

SETTINGS
--------
At the top of the script, you can change these numbers if you want:
- BATCH_SIZE: How many posts to unlike at once (Default: 50).
- MIN_SAFETY_WAIT: How long to wait between batches (Default: 4000ms).

DISCLAIMER
----------
Use this at your own risk. Unliking thousands of posts very quickly might get you temporarily blocked from liking/unliking things for a day or two. Keep an eye on the script while it runs.
