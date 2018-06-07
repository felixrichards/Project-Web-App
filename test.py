import cv2
import numpy as np

original = cv2.imread("NGC-1300.jpg", cv2.IMREAD_GRAYSCALE )
retval, image = cv2.threshold(original, 50, 255, cv2.THRESH_BINARY)

el = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
image = cv2.dilate(image, el, iterations=6)

cv2.imwrite("dilated.png", image)

contours, hierarchy = cv2.findContours(
    image,
    cv2.cv.CV_RETR_LIST,
    cv2.cv.CV_CHAIN_APPROX_SIMPLE
)

drawing = cv2.imread("test.jpg")

centers = []
radii = []
for contour in contours:
    area = cv2.contourArea(contour)

    # there is one contour that contains all others, filter it out
    if area > 500:
        continue

    br = cv2.boundingRect(contour)
    radii.append(br[2])

    m = cv2.moments(contour)
    center = (int(m['m10'] / m['m00']), int(m['m01'] / m['m00']))
    centers.append(center)






# img = cv2.imread('NGC-1300.jpg',0)
# img = cv2.medianBlur(img,5)
# cimg = cv2.cvtColor(img,cv2.COLOR_GRAY2BGR)

# circles = cv2.HoughCircles(img,cv2.HOUGH_GRADIENT,1,img.shape[0]/8,
                            # param1=60,param2=50,minRadius=0,maxRadius=0)
                            
# circles = np.uint16(np.around(circles))
# for i in circles[0,:]:
    # cv2.circle(cimg,(i[0],i[1]),i[2],(0,255,0),2)
    # cv2.circle(cimg,(i[0],i[1]),2,(0,0,255),3)

# cv2.imshow('Detected bulge',cimg)
# cv2.waitKey(0)
# cv2.destroyAllWindows()