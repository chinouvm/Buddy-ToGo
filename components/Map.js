import GoogleMapReact from 'google-map-react';
import useGeoLocation from '../lib/useGeoLocation';
import UserMarker from './UserMarker';

const Map = ({ center, zoom }) => {
  const location = useGeoLocation();

  const currentLat = location.coordinates.lat;
  const currentLng = location.coordinates.lng;
  console.log(currentLat, currentLng);

  return (
    <div className="mapmap">
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyD4_-W20ugg4nLcCVO9CTN-zAt8SvvtpQg' }}
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
