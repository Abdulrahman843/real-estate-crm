import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';

const FavoriteButton = ({ propertyId, initialIsFavorite }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

    const handleToggleFavorite = async () => {
        try {
            const response = await axios.post(`/api/properties/${propertyId}/favorite`);
            setIsFavorite(response.data.isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton onClick={handleToggleFavorite} color="primary">
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default FavoriteButton;