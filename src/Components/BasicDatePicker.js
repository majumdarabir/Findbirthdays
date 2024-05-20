import React, { useState } from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { Box, Typography, Button, List, ListItem, ListItemText, TextField, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

import './style.css'; // Corrected path to CSS file

// Function to fetch historical data for a given date
const fetchHistoricalData = async (language, type, month, day) => {
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/${type}/${month}/${day}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return null;
    }
};

const formatMonthDay = (month, day) => {
    const date = dayjs().month(month - 1).date(day);
    return date.format('MMMM D');
};

const formatMonthYear = (date) => {
    if (!date) return '';
    const dt = dayjs(date);
    const month = dt.month() + 1;
    const year = dt.year();
    return `${month}/${year}`;
};

const BasicDatePicker = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [birthdays, setBirthdays] = useState([]);
    const [favoriteBirthdays, setFavoriteBirthdays] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDateChange = async (date) => {
        if (!date) return;
        setSelectedDate(date);

        const month = date.month() + 1;
        const day = date.date();
        const fetchedData = await fetchHistoricalData('en', 'births', month, day);
        if (fetchedData && fetchedData.births) {
            setBirthdays(fetchedData.births);
            console.log('API Response Data:', fetchedData);
        } else {
            setBirthdays([]);
        }
    };

    const addToFavorites = (birthday) => {
        const month = selectedDate.month() + 1;
        const day = selectedDate.date();
        setFavoriteBirthdays([...favoriteBirthdays, { ...birthday, month, day }]);
    };

    const removeFromFavorites = (birthday) => {
        setFavoriteBirthdays(favoriteBirthdays.filter((fav) => fav.text !== birthday.text));
    };

    const isFavorite = (birthday) => {
        return favoriteBirthdays.some((fav) => fav.text === birthday.text);
    };

    const filteredBirthdays = birthdays.filter((birthday) =>
        birthday.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNextBirthdayClick = async () => {
        const currentDate = selectedDate || dayjs();
        const nextDate = currentDate.add(1, 'day');

        const month = nextDate.month() + 1;
        const day = nextDate.date();

        const fetchedData = await fetchHistoricalData('en', 'births', month, day);
        if (fetchedData && fetchedData.births.length > 0) {
            setBirthdays(fetchedData.births);
            setSelectedDate(nextDate);
        } else {
            console.log('No upcoming birthdays found for the next date.');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <DemoContainer components={['DatePicker']}>
                    <DatePicker
                        label="Pick a date"
                        value={selectedDate}
                        onChange={handleDateChange}
                    />
                </DemoContainer>
                <Box sx={{ mt: 4, width: '100%', maxWidth: 600 }}>
                    <TextField
                        label="Search Birthdays"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />
                    <Typography variant="h5" gutterBottom>
                        <span role="img" aria-label="birthday">🎂</span> Birthdays on {formatMonthYear(selectedDate)}
                    </Typography>
                    <Button className='btn-next' onClick={handleNextBirthdayClick} variant="contained" color="primary" sx={{
                        mt: 2,
                        "&:hover": {
                            backgroundColor: "green",
                        },
                    }}>
                        Next Birthday
                    </Button>
                    <List>
                        {filteredBirthdays.map((birthday, index) => (
                            <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ListItemText primary={`${birthday.text} - ${birthday.year}`} />
                                <IconButton
                                    onClick={() => (isFavorite(birthday) ? removeFromFavorites(birthday) : addToFavorites(birthday))}
                                >
                                    {isFavorite(birthday) ? <StarIcon color="primary" /> : <StarBorderIcon />}
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{ mt: 4, width: '100%', maxWidth: 600 }}>
                    <Typography variant="h5" gutterBottom>
                        <span role="img" aria-label="favorite">⭐</span> Favorite Birthdays
                    </Typography>
                    <List>
                        {favoriteBirthdays.map((birthday, index) => (
                            <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ListItemText
                                    primary={
                                        <>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                                                {formatMonthDay(birthday.month, birthday.day)}
                                            </Typography>
                                            <Typography variant="body1">
                                                {`${birthday.text} - ${birthday.year}`}
                                            </Typography>
                                        </>
                                    }
                                />
                                <IconButton
                                    onClick={() => removeFromFavorites(birthday)}
                                >
                                    <StarIcon color="primary" />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default BasicDatePicker;
