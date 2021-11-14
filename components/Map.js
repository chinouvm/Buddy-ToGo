import GoogleMapReact from 'google-map-react';
import useGeoLocation from '../lib/useGeoLocation';
import UserMarker from './UserMarker';

const Map = ({ center, zoom }) => {
  const location = useGeoLocation();

  const currentLat = location.coordinates.lat;
  const currentLng = location.coordinates.lng;

  return (
    <div className="mapmap">
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY }}
        defaultCenter={center}
        defaultZoom={zoom}
      >
        <UserMarker lat={currentLat} lng={currentLng} />
      </GoogleMapReact>
    </div>
  );
};

Map.defaultProps = {
  center: {
    lat: 51.441642,
    lng: 5.4697225,
  },
  zoom: 15,
};

export default Map;
