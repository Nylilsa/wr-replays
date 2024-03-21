6. Following this, the data is then reduced. Since the data is sorted by ascending date, we have to check if the subsequent score is higher than the current score.
 1. If false, the data is temporarily stored in an object called ``removed``. We do not remove it immediately yet and this will be explained later
 2. If true, nothing is being done with the data.
7. We now have an object with data that contains a mix of unverified entries (score entries without a replay), old verified entries (the entries already existed in ``wrprogression.json``) and new entries (that were gathered from the replays).  I now loop through the object with the data, and a prompt appears for every **new entry**. Te prompt asks something along the line ``Do you wish to verify entry [score] done by [name] on date [date]? [Y/N]``
 1. While I could automatically verify this, sometimes there are illegitimate replays. Those replays could have been done by either cheaters, or people who have played with an ultra patch, or people who changed their system time when saving the replay. This process needs to be done manually, hence the prompt.
8. If a replay has been **approved**, we cycle to the next replay until they all have been exhausted. However, if a replay has been **denied**, it is a bit more complicated. The entry is then removed from the data, and the data is merged with the object ``removed``. Step 7-8 is repeated until no more replays are denied.


Suppose I have the following:

Extra Marisa TD: Verified & unverified checked
Score 600,000,002 was achieved on 01/01/2019 is verified (NEW REPLAY)
Score 599,999,999 was achieved on 01/01/2017 is verified (NEW REPLAY)
Score 599,999,990 was achieved on 01/01/2015 is verified (has evidence)

Extra Marisa TD: Verified checked
Score 600,000,002 was achieved on 01/01/2019 is verified (NEW REPLAY)
Score 599,999,999 was achieved on 01/01/2017 is verified (NEW REPLAY)
Score 599,999,990 was achieved on 01/01/2015 is verified (has evidence)

Original .json:
Score 600,000,001 was achieved on 01/01/2021 is unverified (no evidence)
Score 600,000,000 was achieved on 01/01/2020 is verified (has evidence)
Score 599,999,990 was achieved on 01/01/2015 is verified (has evidence)

Newly found entries:
Score 600,000,002 was achieved on 01/01/2019 is verified (NEW REPLAY)
Score 599,999,999 was achieved on 01/01/2017 is verified (NEW REPLAY)

Result unverified:
null

Result verified:
Score 600,000,002 was achieved on 01/01/2019 is verified (NEW REPLAY)
Score 599,999,999 was achieved on 01/01/2017 is verified (NEW REPLAY)
Score 599,999,990 was achieved on 01/01/2015 is verified (has evidence)

Here's what I should do:

1. Check for any matches between entries in the .json and the replay files. The object now makes a distinction between verified and unverified replays. (done)

2. Split the object into two objects. One object has the unverified data, the other has the verified data. (done)
Score 600,000,001 was achieved on 01/01/2020 is unverified (no evidence)
Score 599,999,990 was achieved on 01/01/2015 is verified (now has evidence)

3. Merge the verified data with the new replays. Sort by score and then reduce it by score. The product is a functional verified WR history of the category. (done)
VERY IMPORTANT NOTE: IF THE NEW REPLAY IS INVALID THEN IT HAS TO BE REMOVED. YOU NEED TO MANUALLY CHECK THIS BY PROVIDING A PROMPT FOR EVERY NEW REPLAY. IF APPROVE, DO NOTHING. IF DENIED, REMOVE ENTRY AND REPEAT PROCESS OF MERGING THINGS
You end up with what's at (Extra Marisa TD: Verified checked). The 2020 entries is reduced because it was never a WR to begin with.

4. We merge the category at (Extra Marisa TD: Verified checked) and we then reduce it. We then look at the **if any unverified entries have been removed**, and we are **NOT** looking at the verified entries. The unverified entries that were reduced are then removed from the object with the unverified entries (because those entries are not considered to be WR anymore).
The score from 2021 is reduced, because it was never a WR to begin with.

5. We are now left with unverified data (that is considered to be a WR if a replay is found) and verified data.

