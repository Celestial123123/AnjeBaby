import math
from turtle import *

# Heart parametric functions
def heart1(M):
    return 15 * math.sin(M) ** 3

def heart2(M):
    return (
        12 * math.cos(M)
        - 5 * math.cos(2 * M)
        - 2 * math.cos(3 * M)
        - math.cos(4 * M)
    )

speed(0)
bgcolor("black")
color("red")
penup()

for i in range(5000):
    M = i * 0.01
    x = heart1(M) * 18
    y = heart2(M) * 18
    goto(x, y)
    pendown()

goto(0, 0)
done()
