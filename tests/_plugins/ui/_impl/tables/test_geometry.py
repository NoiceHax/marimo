# Copyright 2026 Marimo. All rights reserved.

from __future__ import annotations

import pytest

from marimo._plugins.ui._impl.tables.geometry import (
    GEOMETRY_CELL_CAP,
    GeometryColumnInfo,
    find_geometry_columns,
    format_geometry_cell,
)
from tests._plugins.ui._impl.tables import geometry_fixtures as geo


class TestFormatGeometryCell:
    def test_none_passes_through(self) -> None:
        assert format_geometry_cell(None, "objects") is None

    def test_wkb_placeholder(self) -> None:
        assert (
            format_geometry_cell(geo.WKB_POINT_1_2, "wkb")
            == f"<geometry, {len(geo.WKB_POINT_1_2)} B>"
        )

    def test_wkt_passthrough_and_cap(self) -> None:
        assert format_geometry_cell("POINT (1 2)", "wkt") == "POINT (1 2)"
        long = "POLYGON ((" + "1 2, " * 200 + "1 2))"
        capped = format_geometry_cell(long, "wkt")
        assert capped == long[:GEOMETRY_CELL_CAP] + "..."

    def test_other_passes_through(self) -> None:
        assert format_geometry_cell([1.0, 2.0], "other") == [1.0, 2.0]


@pytest.mark.requires("geopandas")
class TestPandasDetection:
    def test_detects_all_geometry_columns(self) -> None:
        import narwhals.stable.v2 as nw

        frame = nw.from_native(geo.gdf_multi_geometry(), eager_only=True)

        assert find_geometry_columns(frame) == {
            "geom_a": GeometryColumnInfo(
                encoding="objects", external_type="geometry"
            ),
            "geom_b": GeometryColumnInfo(
                encoding="objects", external_type="geometry"
            ),
        }

    def test_false_positives_not_detected(self) -> None:
        import narwhals.stable.v2 as nw

        frame = nw.from_native(
            geo.pandas_shapely_object_column(), eager_only=True
        )

        assert find_geometry_columns(frame) == {}
