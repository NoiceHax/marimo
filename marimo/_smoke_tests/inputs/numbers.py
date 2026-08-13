import marimo

__generated_with = "0.15.5"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(mo):
    mo.md(r"""## Basic""")
    return


@app.cell
def _(mo):
    mo.ui.number()
    return


@app.cell
def _(mo):
    mo.ui.number(-10, 10)
    return


@app.cell
def _(mo):
    mo.md(
        r"""
        ## `step` is an increment, not a constraint

        The value shown in each input must match its `.value` exactly, even
        though neither is a multiple of `step` away from `start`. Typing a
        number finer than `step` must keep every digit; the stepper buttons
        and the arrow keys move by `step`.
        """
    )
    return


@app.cell
def _(mo):
    fine_step = mo.ui.number(
        start=1.25557, stop=20, step=0.001, value=2.23, label="Fine step"
    )
    fine_step
    return (fine_step,)


@app.cell
def _(fine_step):
    fine_step.value
    return


@app.cell
def _(mo):
    coarse_step = mo.ui.number(
        start=1.222, stop=20, step=0.01, value=2.23345, label="Coarse step"
    )
    coarse_step
    return (coarse_step,)


@app.cell
def _(coarse_step):
    coarse_step.value
    return


@app.cell
def _(mo):
    mo.md(r"""## Edge cases""")
    return


@app.cell
def _(mo):
    # Above max safe int
    BAD_INT = 999999999999999990
    v = mo.ui.number(
        value=BAD_INT, start=BAD_INT - 5, stop=BAD_INT + 5, full_width=True
    )
    v
    return (v,)


@app.cell
def _(v):
    v.value
    return


@app.cell
def _(mo):
    def on_change(new_value):
        print(new_value)


    mo.ui.number(start=-1e255, stop=1e255, value=5, on_change=on_change)
    return (on_change,)


@app.cell
def _(mo, on_change):
    import numpy as np

    # Cannot set infinity as range
    mo.ui.number(start=-np.inf, stop=np.inf, value=5, on_change=on_change)
    return


if __name__ == "__main__":
    app.run()
