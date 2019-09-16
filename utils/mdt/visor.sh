#!/bin/bash

echo -e "Coordenada Latitud"
read latitud

echo -e "Coordenada Longitud"
read longitud

echo -e "Extensión (en km)"
read extension

sur=$(($latitud - $extension*500))
norte=$(($latitud + $extension*500))
oeste=$(($longitud - $extension*500))
este=$(($longitud + $extension*500))

/usr/bin/gdal_translate -projwin ${oeste} ${norte} ${este} ${sur} -of GTiff mdt5.xml mdt.tif
