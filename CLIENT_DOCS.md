# Allison's Classroom Portal — User Guide

Welcome to your classroom management portal! This guide explains how to manage all the content on your classroom website.

---

## Getting Started

### Accessing the Admin Dashboard

1. Go to `https://allisons-classroom.vercel.app/admin/login` (replace with your actual domain)
2. Enter your email and password
3. You'll see the admin dashboard with quick action links

**Note**: Keep your admin password secure. Don't share it with students or parents.

---

## Daily Tasks

### Posting an Announcement

Announcements appear on the home page and in the "Classroom News" section.

1. From the dashboard, click **New Announcement**
2. Fill in the form:
   - **Title**: Short headline (e.g., "Great work on the poetry project!")
   - **Body**: Main message (use line breaks for readability)
   - **Link URL** (optional): Paste a link to a relevant resource
   - **Attachment URL** (optional): Link to a file or document
   - **Pin to top**: Check this to pin it above other announcements
3. Click **Publish**

The announcement appears immediately on the public site under "Latest News."

**Example**: 
```
Title: End of Unit 2 Project Due Friday
Body: 
Remember that your written analysis is due by 11:59 PM Friday. 

What to include:
- Your thesis statement
- At least 3 supporting paragraphs
- A conclusion that restates your main idea

Questions? Email me or ask in Google Classroom.
```

---

### Adding an Assignment

Assignments are organized by class and show a due date.

1. Click **Assignments** in the admin menu
2. Click **New Assignment**
3. Fill in:
   - **Class**: Select from your 6 classes (5th/6th English, Reading, Social Studies)
   - **Title**: Assignment name (e.g., "Chapter 5 Reading Response")
   - **Description**: What to do (optional but recommended)
   - **Due Date**: Select from calendar
   - **Resource URL** (optional): Link to Google Drive, Classroom, or external resource
4. Click **Create**

The assignment appears on that class page and on the home page.

**Tips**:
- Due dates show in red if they're overdue, bold if due today
- Link to Google Classroom for full assignment details
- Use Google Drive links that parents can access with a shareable link

---

### Uploading Classroom Photos

Share what's happening in your classroom with regular photo updates.

1. Click **Photos** in the admin menu
2. Click **New Photo**
3. Upload your photo to Google Drive or Imgur first (set to "anyone with the link can view")
4. Paste the image URL:
   - **Google Drive**: Right-click image → Open image in new tab → Copy URL (keep only the file ID)
   - **Imgur**: Direct link after upload
5. Add a **Caption** (what's happening in the photo)
6. Click **Upload Photo**

Photos appear in the "What's Happening" section on the public site.

**Best Practices**:
- No student faces or names in captions (privacy first)
- Describe the activity: "Fifth graders working on fractions"
- One photo per upload for simplicity

---

### Updating the Schedule

Keep parents updated on your class schedule.

1. Click **Schedule** in the admin menu
2. Upload your schedule image to Google Drive or Imgur
3. Paste the image URL
4. Add optional notes (e.g., "Schedule subject to change based on field trips")
5. Click **Save Schedule**

The schedule appears on the "Class Schedule" public page.

---

### Managing External Links

Keep your link hub organized and up-to-date.

1. Click **Links** in the admin menu
2. Click **New Link**
3. Fill in:
   - **Category**: gradebook, school, classroom_tools, reading, curriculum, or other
   - **Title**: Link name (e.g., "Google Classroom")
   - **URL**: Full URL (https://...)
   - **Description**: What the link is for (optional)
4. Click **Add Link**

Links appear organized by category on the "Helpful Links" public page.

---

### Editing Static Pages

Update the About and Contact pages with your information.

1. Click **Pages** in the admin menu
2. Select the page (About or Contact)
3. Edit the **Title** and **Content**
4. Use basic HTML or Markdown:
   ```
   <h2>About Me</h2>
   <p>I've been teaching 5th and 6th grade for...</p>
   
   <h3>Classroom Rules</h3>
   <ul>
   <li>Be respectful</li>
   <li>Work hard</li>
   <li>Help each other</li>
   </ul>
   ```
5. Click **Save Page**

---

## Troubleshooting

### I forgot my password
Email Zach to reset your password in Supabase.

### An assignment isn't showing up
- Check that the **due date is set**
- Make sure the **class is selected**
- Verify it's in the correct **class section** (5th English vs. 6th Reading, etc.)

### Photos aren't displaying
- Verify the image URL is correct and accessible to public viewers
- Try uploading the image to Imgur instead of Google Drive for reliability
- Check that the link doesn't require login

### My site isn't loading
1. Check your internet connection
2. Go to https://www.isitdownrightnow.com and check if Vercel is down
3. Email Zach if issues persist

---

## Best Practices

1. **Update regularly**: Post at least one announcement per week to keep parents engaged
2. **Use due dates**: Always set due dates for assignments so parents know deadlines
3. **Link to Google Classroom**: Parents can't access Google Classroom, but you can post a note with a link
4. **Test links**: Before publishing, test that attachment and resource URLs work
5. **Keep it professional**: Remember that parents and students are reading this

---

## Support

If you have questions or need help:
1. Check this guide first
2. Email Zach with details about what you're trying to do
3. Include screenshots if possible

---

**Version 1.0**  
**Created**: May 2026  
**Last Updated**: May 2026
