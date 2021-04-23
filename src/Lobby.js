import {
  Grid,
  Box,
  Paper,
  Typography,
  Badge,
  IconButton,
} from "@material-ui/core";

export const Lobby = ({ users, myName, onSelectRecipient }) => (
  <Grid container spacing={2}>
    {users.map(({ name, status }) => {
      if (myName === name) return null;

      return (
        <Grid item xs="auto" key={name}>
          <Badge
            badgeContent={status === "ONLINE" ? "online" : "offline"}
            color={status === "ONLINE" ? "primary" : "secondary"}
          >
            <IconButton
              style={{ borderRadius: 8 }}
              onClick={() => onSelectRecipient(name)}
            >
              <Paper component={Box} p={2}>
                <Typography>{name}</Typography>
              </Paper>
            </IconButton>
          </Badge>
        </Grid>
      );
    })}
  </Grid>
);
