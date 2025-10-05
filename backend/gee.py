import os
from datetime import datetime

import ee


_ee_initialized = False


def _init_ee() -> None:
    global _ee_initialized
    if _ee_initialized:
        return

    # Initialize Earth Engine
    # If running on a server with service account:
    # set GOOGLE_APPLICATION_CREDENTIALS to the JSON key path
    try:
        service_account = os.getenv("GEE_SERVICE_ACCOUNT")
        key_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if service_account and key_file and os.path.exists(key_file):
            credentials = ee.ServiceAccountCredentials(service_account, key_file)
            ee.Initialize(credentials)
        else:
            ee.Initialize()
    except Exception:
        # Last resort: anonymous init (limited)
        ee.Initialize(opt_url='https://earthengine-highvolume.googleapis.com')
    _ee_initialized = True


def _season_from_month(month: int, lat: float) -> str:
    is_north = lat >= 0
    # Simple seasonal mapping
    if is_north:
        if month in (12, 1, 2):
            return "Winter"
        if month in (3, 4, 5):
            return "Spring"
        if month in (6, 7, 8):
            return "Summer"
        return "Autumn"
    else:
        if month in (12, 1, 2):
            return "Summer"
        if month in (3, 4, 5):
            return "Autumn"
        if month in (6, 7, 8):
            return "Winter"
        return "Spring"


def fetch_ndvi_for_point(lat: float, lon: float, year: int) -> tuple:
    try:
        _init_ee()

        point = ee.Geometry.Point([lon, lat])

        collection = (
            ee.ImageCollection('MODIS/061/MOD13Q1')
            .filterBounds(point)
            .filterDate(f"{year}-01-01", f"{year}-12-31")
        )

        # NDVI band is 'NDVI' in MOD13Q1; scale is 1e4
        def scale_ndvi(img):
            ndvi = img.select('NDVI').multiply(0.0001).rename('NDVI')
            return img.addBands(ndvi, overwrite=True)

        scaled = collection.map(scale_ndvi)

        # Compute mean NDVI for the year at the point (buffer to small neighborhood)
        neighborhood = point.buffer(250)  # 250m radius
        mean_img = scaled.select('NDVI').mean()
        mean_value = mean_img.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=neighborhood,
            scale=250,
            maxPixels=1_000_000
        ).get('NDVI')

        ndvi_value = float(ee.Number(mean_value).getInfo() or 0.0)
    except Exception:
        # Safe fallback if GEE fails
        ndvi_value = 0.45

    season = _season_from_month(datetime.utcnow().month, lat)
    return ndvi_value, season


def get_ndvi_tile_and_thumbnail(lat: float, lon: float, year: int) -> tuple:
    try:
        _init_ee()

        point = ee.Geometry.Point([lon, lat])
        collection = (
            ee.ImageCollection('MODIS/061/MOD13Q1')
            .filterBounds(point)
            .filterDate(f"{year}-01-01", f"{year}-12-31")
        )

        def scale_ndvi(img):
            ndvi = img.select('NDVI').multiply(0.0001).rename('NDVI')
            return ndvi

        composite = collection.map(scale_ndvi).median()

        vis_params = {
            'min': 0.0,
            'max': 1.0,
            'palette': ['brown', 'beige', 'yellow', 'green']
        }

        map_id = ee.Image(composite).getMapId(vis_params)
        tile_url = map_id['tile_fetcher'].url_format

        # Thumbnail for the area around the point
        region = point.buffer(2000).bounds()  # ~2km box
        thumb_params = {
            'region': region,
            'dimensions': 512,
            'min': vis_params['min'],
            'max': vis_params['max'],
            'palette': vis_params['palette']
        }
        thumbnail_url = ee.Image(composite).getThumbURL(thumb_params)

        return tile_url, thumbnail_url
    except Exception:
        # If GEE fails, return no overlay URLs
        return None, None


