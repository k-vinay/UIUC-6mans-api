# UIUC 6Mans API V1

## __Users__
### Users contain the following fields:

username: a unique username for the user (**REQUIRED**),

nickname: if set, acts like the user's display name, otherwise, use the username as a display name,

elo: the user's mmr - used to calculate ranks,

discordTag: the user's discord tag - doesn't affect anything so do whatever you like with this field,

discordId: the user's discord id - doesn't affect anything so do whatever you like with this field,

dateCreated: when the user was created - can be used like "has been playing since ..."
    
**rank**: not stored in db, DO NOT pass it in to a post/put, but will be returned by the get requests to make it easier to display user data

### Endpoints: GET/POST '/users', GET/PUT/DELETE '/users/:username'

you can get all users, or pass in query parameters, or get/put/delete by username

## __Matches__
### Matches contain the following fields:

team1/team2: an array containing the minimum data stored for each player in the match

    -each element in the array only stores username, nickname, and elo

result: the winner of the match: 0 is tie/in progress/not counted, 1 is team 1, 2 is team 2

team1EloDiff/team2EloDiff: amount of elo gained from the match (losses will be negative numbers)

	-almost guaranteed that these will add up to 0, but separated just in case for the future

matchDate: use for chronological ordering (calculate winstreaks, player elo graph, etc)

### Endpoints: GET '/matches', GET/PUT/DELETE '/matches/:_id'

notice the lack of a POST to matches. this will be handled by the report endpoint

## __Other Endpoints__
### Report: POST '/matches/report'

request body should follow this format:

    {
        {
    		team1: ["username1", "username2", "username3"],
    		team2: ["username1", "username2", "username3"],
    		result: pick from 0,1,2 to represent result
    	}
    	matchDate: <optional, if not provided will be generated as current time>
	}
the API will populate required info from the usernames, calculate elo diffs, and update the elos for the users in the match